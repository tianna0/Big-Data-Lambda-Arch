import org.apache.kafka.common.serialization.StringDeserializer
import org.apache.spark.SparkConf
import org.apache.spark.streaming._
import org.apache.spark.streaming.kafka010.ConsumerStrategies.Subscribe
import org.apache.spark.streaming.kafka010.LocationStrategies.PreferConsistent
import org.apache.spark.streaming.kafka010._
import com.fasterxml.jackson.databind.{ DeserializationFeature, ObjectMapper }
import com.fasterxml.jackson.module.scala.experimental.ScalaObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import org.apache.hadoop.conf.Configuration
import org.apache.hadoop.hbase.TableName
import org.apache.hadoop.hbase.HBaseConfiguration
import org.apache.hadoop.hbase.client.{ ConnectionFactory, Put }
import org.apache.hadoop.hbase.util.Bytes

object StreamRisk {
  val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  val hbaseConf: Configuration = HBaseConfiguration.create()
  val hbaseConnection = ConnectionFactory.createConnection(hbaseConf)
  val table = hbaseConnection.getTable(TableName.valueOf("txin_latest_risk"))

  def main(args: Array[String]) {
    println("=== StreamRisk Application Starting ===")

    if (args.length < 1) {
      System.err.println(
        """
          |Usage: StreamRisk <brokers>
          |  <brokers> is a list of one or more Kafka brokers
          |""".stripMargin
      )
      System.exit(1)
    }

    val Array(brokers) = args
    println(s"Kafka brokers: $brokers")


    val sparkConf = new SparkConf().setAppName("StreamRisk")
    val ssc = new StreamingContext(sparkConf, Seconds(2))
    println("Spark Streaming context initialized")


    val topicsSet = Set("txin_final")
    val kafkaParams = Map[String, Object](
      "bootstrap.servers" -> brokers,
      "key.deserializer" -> classOf[StringDeserializer],
      "value.deserializer" -> classOf[StringDeserializer],
      "group.id" -> "risk_group",
      "auto.offset.reset" -> "earliest",
      "enable.auto.commit" -> (false: java.lang.Boolean)
    )
    println(s"Kafka parameters: $kafkaParams")


    val stream = KafkaUtils.createDirectStream[String, String](
      ssc, PreferConsistent,
      Subscribe[String, String](topicsSet, kafkaParams)
    )
    println("Kafka direct stream created")


    val records = stream.map(_.value)
    records.foreachRDD { rdd =>
      println(s"Received RDD with ${rdd.count()} records")
      rdd.foreach(record => println(s"Raw record: $record"))
    }


    val risks = records.map { rec =>
      try {
        val riskData = mapper.readValue(rec, classOf[RiskData])
        println(s"Parsed RiskData: $riskData")
        riskData
      } catch {
        case e: Exception =>
          println(s"Error parsing record: $rec. Exception: ${e.getMessage}")
          null
      }
    }.filter(_ != null)


    risks.foreachRDD { rdd =>
      println(s"Writing ${rdd.count()} records to HBase")
      rdd.foreach { risk =>
        try {
          val put = new Put(Bytes.toBytes(risk.risk_level))
          put.addColumn(Bytes.toBytes("risk"), Bytes.toBytes("count"), Bytes.toBytes(risk.count.toString))
          put.addColumn(Bytes.toBytes("risk"), Bytes.toBytes("timestamp"), Bytes.toBytes(risk.timestamp))
          table.put(put)
          println(s"Successfully wrote RiskData to HBase: $risk")
        } catch {
          case e: Exception =>
            println(s"Error writing to HBase: $risk. Exception: ${e.getMessage}")
        }
      }
    }

    println("Starting Spark Streaming context")
    ssc.start()

    println("Awaiting termination")
    ssc.awaitTermination()
  }
}

case class RiskData(
    risk_level: String,
    count: Int,
    timestamp: String
)
