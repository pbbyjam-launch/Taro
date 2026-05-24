import Foundation

enum AnthropicModels {
    static let haiku = "claude-haiku-4-5"
}

struct AnthropicService: AffirmationGenerating {
    func generateAffirmation(thought: String, date: Date, apiKey: String) async throws -> String {
        let url = URL(string: "https://api.anthropic.com/v1/messages")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "model": AnthropicModels.haiku,
            "max_tokens": 150,
            "temperature": 0.75,
            "system": AffirmationPrompt.system,
            "messages": [
                [
                    "role": "user",
                    "content": AffirmationPrompt.userMessage(thought: thought, date: date)
                ]
            ]
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)
        try HTTPResponseHelpers.checkSuccess(response: response, data: data)

        guard
            let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
            let contentBlocks = json["content"] as? [[String: Any]],
            let first = contentBlocks.first(where: { ($0["type"] as? String) == "text" }),
            let text = first["text"] as? String
        else {
            throw AffirmationError.invalidResponse
        }

        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { throw AffirmationError.invalidResponse }
        return trimmed
    }
}
