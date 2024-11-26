# Validated SQS

Validate your SQS messages with JSON Schema.

## Usage

1. Create a file with the following code:

```typescript
import { createHandler } from "validated-sqs";

export const handler = createHandler({
  schema: {
    type: "object",
    properties: {
      foo: { type: "string" },
    },
    required: ["foo"],
  },
  queueUrl: "https://sqs.eu-west-1.amazonaws.com/123456789012/my-queue",
});
```

1. Deploy it to AWS Lambda.

## Why this approach?

Distributing this as a package allows for maximum flexibility and the ability to be integrated into existing apps that use tools like aws-cdk and sst. This also allows for callers to add custom code before and after the validation step.
