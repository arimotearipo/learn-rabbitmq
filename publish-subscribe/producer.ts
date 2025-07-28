import { faker } from "@faker-js/faker"
import amqp from "amqplib"
import { DURABLE, EXCHANGE_1, EXCHANGE_2, EXCHANGE_3 } from "./common"

let MESSAGE_COUNT = 10

function getSentences() {
	const sentences = []

	for (let i = 0; i < MESSAGE_COUNT; i++) {
		sentences.push(faker.lorem.sentence({ min: 1, max: 3 }))
	}

	return sentences
}

async function produce() {
	const sentences = getSentences()

	const connection = await amqp.connect("amqp://user:password@localhost")
	const channel = await connection.createChannel()

	await channel.assertExchange(EXCHANGE_1, "fanout", { durable: DURABLE })
	await channel.assertExchange(EXCHANGE_2, "fanout", { durable: DURABLE })
	await channel.assertExchange(EXCHANGE_3, "fanout", { durable: DURABLE })

	for (let i = 0; i < sentences.length; i++) {
		const wordCount = sentences[i].split(" ").length

		if (wordCount === 1) {
			channel.publish(EXCHANGE_1, "", Buffer.from(sentences[i]))
			console.log(`Sent: ${sentences[i]} (${i + 1}/${MESSAGE_COUNT})`)
		}
		if (wordCount === 2) {
			channel.publish(EXCHANGE_2, "", Buffer.from(sentences[i]))
			console.log(`Sent: ${sentences[i]} (${i + 1}/${MESSAGE_COUNT})`)
		}
		if (wordCount === 3) {
			channel.publish(EXCHANGE_3, "", Buffer.from(sentences[i]))
			console.log(`Sent: ${sentences[i]} (${i + 1}/${MESSAGE_COUNT})`)
		}
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
