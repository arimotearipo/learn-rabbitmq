import { basename } from "node:path"
import amqp from "amqplib"
import { DURABLE, EXCHANGE, KEYS } from "./common"

async function consume() {
	console.clear()

	let messagesCount = 0

	const filename = basename(import.meta.url)

	const connection = await amqp.connect("amqp://user:password@localhost")
	const channel = await connection.createChannel()

	await channel.assertExchange(EXCHANGE, "topic", { durable: DURABLE })

	const topic = KEYS[1]

	const queue = await channel.assertQueue("", {
		exclusive: true,
	})

	await channel.bindQueue(queue.queue, EXCHANGE, topic)

	console.log(
		`${filename}: Waiting for messages in ${queue.queue} with topic ${topic}. To exit press CTRL+C`,
	)
	channel.consume(queue.queue, (msg) => {
		if (msg !== null) {
			console.log(`Received: ${msg.content.toString()}`)
			channel.ack(msg)
			messagesCount++
		}
	})

	console.log(`Total messages processed: ${messagesCount}`)
}

consume().catch(console.error)
