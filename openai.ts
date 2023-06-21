import { Configuration, OpenAIApi } from "openai"

const config = new Configuration({
    apiKey: process.env.NEXT_PUBLIC_OPENAPI,
})

const openapi = new OpenAIApi(config)

export default openapi;