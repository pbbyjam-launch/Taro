import Foundation

enum HTTPResponseHelpers {
    static func checkSuccess(response: URLResponse, data: Data) throws {
        guard let http = response as? HTTPURLResponse else { return }
        guard (200...299).contains(http.statusCode) else {
            let message = parseAPIErrorMessage(data: data) ?? "Unknown error"
            throw AffirmationError.httpError(status: http.statusCode, message: message)
        }
    }

    private static func parseAPIErrorMessage(data: Data) -> String? {
        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return String(data: data, encoding: .utf8)
        }
        if let error = json["error"] as? [String: Any], let message = error["message"] as? String {
            return message
        }
        if let message = json["message"] as? String { return message }
        return String(data: data, encoding: .utf8)
    }
}
