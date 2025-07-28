import amqp from "amqplib"
import { DURABLE, TASK_QUEUE } from "./common.js"

let MESSAGE_COUNT = 10

async function produce() {
	const connection = await amqp.connect("amqp://user:password@localhost")
	const channel = await connection.createChannel()

	await channel.assertQueue(TASK_QUEUE, { durable: DURABLE })

	for (let i = 0; i < MESSAGE_COUNT; i++) {
		const message = `${i + 1} - Hello World!`
		channel.sendToQueue(TASK_QUEUE, Buffer.from(message))
		console.log(`Sent: ${message} (${i + 1}/${MESSAGE_COUNT})`)
	}

	setTimeout(() => {
		connection.close()
		process.exit(0)
	}, 500)
}

if (process.argv[1]) {
	MESSAGE_COUNT = parseInt(process.argv[2]) || MESSAGE_COUNT
	console.log(`Producing ${MESSAGE_COUNT} messages...`)
}

produce().catch(console.error)
