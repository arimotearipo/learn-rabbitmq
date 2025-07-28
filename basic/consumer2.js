import { basename } from "node:path"
import amqp from "amqplib"
import { DURABLE, TASK_QUEUE } from "./common.js"

async function consume() {
	console.clear()

	let messagesCount = 0

	const filename = basename(import.meta.url)

	const connection = await amqp.connect("amqp://user:password@localhost")
	const channel = await connection.createChannel()

	await channel.assertQueue(TASK_QUEUE, { durable: DURABLE })

	console.log(
		`${filename}: Waiting for messages in ${TASK_QUEUE}. To exit press CTRL+C`,
	)
	channel.consume(TASK_QUEUE, (msg) => {
		if (msg !== null) {
			console.log(`Received: ${msg.content.toString()}`)
			channel.ack(msg)
			messagesCount++
		}
	})

	console.log(`Total messages processed: ${messagesCount}`)
}

consume().catch(console.error)
