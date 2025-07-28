import { basename } from "node:path"
import amqp from "amqplib"
import { DURABLE, EXCHANGE_1 } from "./common"

async function consume() {
	console.clear()

	let messagesCount = 0

	const filename = basename(import.meta.url)

	const connection = await amqp.connect("amqp://user:password@localhost")
	const channel = await connection.createChannel()

	await channel.assertExchange(EXCHANGE_1, "fanout", { durable: DURABLE })

	const queue = await channel.assertQueue("", {
		exclusive: true,
	})

	await channel.bindQueue(queue.queue, EXCHANGE_1, "")

	console.log(
		`${filename}: Waiting for messages in ${queue.queue}. To exit press CTRL+C`,
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
