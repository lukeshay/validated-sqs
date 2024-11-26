import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Ajv, type ErrorObject, type JSONSchemaType, type Schema } from "ajv";

const sqs = new SQSClient();

const ajv = new Ajv();

const validateRequest = ajv.compile({
	type: "object",
	required: ["MessageBody"],
	properties: {
		MessageBody: {
			type: "string",
			description: "The content of the message.",
		},
		DelaySeconds: {
			type: "integer",
			description: "The delay in seconds for the message.",
		},
		MessageAttributes: {
			type: "object",
			additionalProperties: {
				type: "object",
				required: ["DataType"],
				properties: {
					StringValue: {
						type: "string",
					},
					BinaryValue: {
						type: "string",
						contentEncoding: "base64",
						description: "Binary data in base64 encoding.",
					},
					StringListValues: {
						type: "array",
						items: {
							type: "string",
						},
					},
					BinaryListValues: {
						type: "array",
						items: {
							type: "string",
							contentEncoding: "base64",
						},
					},
					DataType: {
						type: "string",
						description: "The data type of the message attribute.",
					},
				},
			},
		},
		MessageSystemAttributes: {
			type: "object",
			additionalProperties: {
				type: "object",
				required: ["DataType"],
				properties: {
					StringValue: {
						type: "string",
					},
					BinaryValue: {
						type: "string",
						contentEncoding: "base64",
						description: "Binary data in base64 encoding.",
					},
					StringListValues: {
						type: "array",
						items: {
							type: "string",
						},
					},
					BinaryListValues: {
						type: "array",
						items: {
							type: "string",
							contentEncoding: "base64",
						},
					},
					DataType: {
						type: "string",
						description: "The data type of the system attribute.",
					},
				},
			},
		},
		MessageDeduplicationId: {
			type: "string",
			description: "The deduplication ID for the message.",
		},
		MessageGroupId: {
			type: "string",
			description: "The group ID for the message.",
		},
	},
	additionalProperties: false,
});

export class AjvError extends Error {
	constructor(
		message: string,
		public errors:
			| ErrorObject<string, Record<string, any>, unknown>[]
			| null
			| undefined,
	) {
		super(message);
	}
}

export type CreateHandlerInput = {
	schema: Schema | JSONSchemaType<unknown>;
	queueUrl: string;
};

export function createHandler(input: CreateHandlerInput) {
	const validate = ajv.compile(input.schema);

	return async (event: unknown) => {
		if (!validateRequest(event)) {
			throw new AjvError("Invalid request", validateRequest.errors);
		}

		if (!validate(JSON.parse(event.MessageBody))) {
			throw new AjvError("Invalid message body", validate.errors);
		}

		const result = await sqs.send(
			new SendMessageCommand({
				...event,
				QueueUrl: input.queueUrl,
			}),
		);

		return result;
	};
}
