import Foundation

enum AIProvider: String, CaseIterable, Identifiable {
    case openAI = "OpenAI"
    case anthropic = "Anthropic"

    var id: String { rawValue }
}

enum AffirmationError: LocalizedError {
    case emptyThought
    case thoughtTooLong(max: Int)
    case missingAPIKey
    case invalidResponse
    case httpError(status: Int, message: String)
    case network(Error)

    var errorDescription: String? {
        switch self {
        case .emptyThought:
            return "Write a thought about your day first."
        case .thoughtTooLong(let max):
            return "Keep your thought under \(max) characters."
        case .missingAPIKey:
            return "Add your API key in Settings."
        case .invalidResponse:
            return "Could not read the affirmation from the response. Try again."
        case .httpError(let status, let message):
            return "Request failed (\(status)): \(message)"
        case .network(let error):
            return error.localizedDescription
        }
    }
}

protocol AffirmationGenerating: Sendable {
    func generateAffirmation(thought: String, date: Date, apiKey: String) async throws -> String
}

enum AffirmationService {
    static let maxThoughtLength = 2000

    static func validate(thought: String) throws {
        let trimmed = thought.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { throw AffirmationError.emptyThought }
        guard trimmed.count <= maxThoughtLength else {
            throw AffirmationError.thoughtTooLong(max: maxThoughtLength)
        }
    }

    static func makeGenerator(provider: AIProvider) -> AffirmationGenerating {
        switch provider {
        case .openAI:
            return OpenAIService()
        case .anthropic:
            return AnthropicService()
        }
    }

    static func generate(
        thought: String,
        date: Date,
        provider: AIProvider,
        apiKey: String
    ) async throws -> String {
        try validate(thought: thought)
        guard !apiKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw AffirmationError.missingAPIKey
        }
        let generator = makeGenerator(provider: provider)
        return try await generator.generateAffirmation(
            thought: thought.trimmingCharacters(in: .whitespacesAndNewlines),
            date: date,
            apiKey: apiKey.trimmingCharacters(in: .whitespacesAndNewlines)
        )
    }
}
