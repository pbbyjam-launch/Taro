import SwiftUI

struct SettingsView: View {
    @State private var provider: AIProvider = AppSettings.provider
    @State private var apiKey: String = KeychainService.readAPIKey() ?? ""
    @State private var reminderEnabled: Bool = AppSettings.reminderEnabled
    @State private var reminderTime: Date = Self.defaultReminderTime()
    @State private var saveMessage: String?
    @State private var showSaveConfirmation = false

    var body: some View {
        NavigationStack {
            Form {
                Section("AI provider") {
                    Picker("Provider", selection: $provider) {
                        ForEach(AIProvider.allCases) { p in
                            Text(p.rawValue).tag(p)
                        }
                    }
                    .onChange(of: provider) { _, newValue in
                        AppSettings.provider = newValue
                    }
                    .accessibilityLabel("AI provider")

                    SecureField("API key", text: $apiKey)
                        .textContentType(.password)
                        .autocorrectionDisabled()
                        .accessibilityLabel("API key")

                    Button("Save API key") {
                        saveAPIKey()
                    }
                }

                Section("Daily reminder") {
                    Toggle("Remind me each day", isOn: $reminderEnabled)
                        .onChange(of: reminderEnabled) { _, enabled in
                            Task { await updateReminder(enabled: enabled) }
                        }

                    if reminderEnabled {
                        DatePicker(
                            "Reminder time",
                            selection: $reminderTime,
                            displayedComponents: .hourAndMinute
                        )
                        .onChange(of: reminderTime) { _, _ in
                            Task { await updateReminder(enabled: true) }
                        }
                    }
                }

                Section("Privacy") {
                    Text(
                        "Your thoughts are stored only on this device. When you generate an affirmation, " +
                        "your thought is sent to the AI provider you choose using the API key you provide. " +
                        "The key is stored in the device Keychain."
                    )
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Settings")
            .onAppear {
                provider = AppSettings.provider
                apiKey = KeychainService.readAPIKey() ?? ""
                reminderEnabled = AppSettings.reminderEnabled
                reminderTime = Self.reminderTimeFromSettings()
            }
            .alert("Saved", isPresented: $showSaveConfirmation) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(saveMessage ?? "Settings updated.")
            }
        }
    }

    private func saveAPIKey() {
        AppSettings.provider = provider
        do {
            if apiKey.isEmpty {
                KeychainService.deleteAPIKey()
                saveMessage = "API key removed."
            } else {
                try KeychainService.saveAPIKey(apiKey)
                saveMessage = "API key saved securely."
            }
            showSaveConfirmation = true
        } catch {
            saveMessage = error.localizedDescription
            showSaveConfirmation = true
        }
    }

    private func updateReminder(enabled: Bool) async {
        AppSettings.reminderEnabled = enabled
        let components = Calendar.current.dateComponents([.hour, .minute], from: reminderTime)
        AppSettings.reminderHour = components.hour ?? 20
        AppSettings.reminderMinute = components.minute ?? 0

        if enabled {
            let granted = await NotificationService.requestAuthorization()
            guard granted else {
                reminderEnabled = false
                AppSettings.reminderEnabled = false
                saveMessage = "Enable notifications in System Settings to use reminders."
                showSaveConfirmation = true
                return
            }
            do {
                try await NotificationService.scheduleDailyReminder(
                    hour: AppSettings.reminderHour,
                    minute: AppSettings.reminderMinute
                )
            } catch {
                saveMessage = error.localizedDescription
                showSaveConfirmation = true
            }
        } else {
            NotificationService.cancelReminder()
        }
    }

    private static func defaultReminderTime() -> Date {
        var components = DateComponents()
        components.hour = 20
        components.minute = 0
        return Calendar.current.date(from: components) ?? Date()
    }

    private static func reminderTimeFromSettings() -> Date {
        var components = DateComponents()
        components.hour = AppSettings.reminderHour
        components.minute = AppSettings.reminderMinute
        return Calendar.current.date(from: components) ?? defaultReminderTime()
    }
}
