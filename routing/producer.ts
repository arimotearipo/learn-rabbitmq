import { writeFileSync } from "node:fs"
import { faker } from "@faker-js/faker"
import amqp from "amqplib"
import { DURABLE, EXCHANGE, KEYS } from "./common"

let MESSAGE_COUNT = 10

function getMessages() {
	const messages = []

	for (let i = 0; i < MESSAGE_COUNT; i++) {
		const sentences = faker.lorem.word()
		const level = faker.helpers.arrayElement(KEYS)
		messages.push({ text: sentences, level })
	}

	return messages
}

async function produce() {
	const messages = getMessages()

	writeFileSync("messages.json", JSON.stringify(messages))

	const connection = await amqp.connect("amqp://user:password@localhost")
	const channel = await connection.createChannel()

	await channel.assertExchange(EXCHANGE, "topic", { durable: DURABLE })

	for (let i = 0; i < messages.length; i++) {
		const { level, text } = messages[i]

		channel.publish(EXCHANGE, messages[i].level, Buffer.from(text))
		console.log(`Sent ${text} with routing key ${level}`)
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
