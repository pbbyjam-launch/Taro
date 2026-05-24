import Foundation

enum AppSettings {
    private enum Keys {
        static let provider = "aiProvider"
        static let reminderEnabled = "reminderEnabled"
        static let reminderHour = "reminderHour"
        static let reminderMinute = "reminderMinute"
    }

    static var provider: AIProvider {
        get {
            guard let raw = UserDefaults.standard.string(forKey: Keys.provider),
                  let value = AIProvider(rawValue: raw) else {
                return .openAI
            }
            return value
        }
        set {
            UserDefaults.standard.set(newValue.rawValue, forKey: Keys.provider)
        }
    }

    static var reminderEnabled: Bool {
        get { UserDefaults.standard.bool(forKey: Keys.reminderEnabled) }
        set { UserDefaults.standard.set(newValue, forKey: Keys.reminderEnabled) }
    }

    static var reminderHour: Int {
        get {
            let stored = UserDefaults.standard.integer(forKey: Keys.reminderHour)
            return stored == 0 && !UserDefaults.standard.contains(Keys.reminderHour) ? 20 : stored
        }
        set { UserDefaults.standard.set(newValue, forKey: Keys.reminderHour) }
    }

    static var reminderMinute: Int {
        get { UserDefaults.standard.integer(forKey: Keys.reminderMinute) }
        set { UserDefaults.standard.set(newValue, forKey: Keys.reminderMinute) }
    }

    static var reminderDateComponents: DateComponents {
        DateComponents(hour: reminderHour, minute: reminderMinute)
    }
}

private extension UserDefaults {
    func contains(_ key: String) -> Bool {
        object(forKey: key) != nil
    }
}
