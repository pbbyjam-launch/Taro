import SwiftUI
import SwiftData

@main
struct DailyAffirmationApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @State private var selectedTab = 0

    var body: some Scene {
        WindowGroup {
            MainTabView(selectedTab: $selectedTab)
                .onReceive(NotificationCenter.default.publisher(for: .openTodayTab)) { _ in
                    selectedTab = 0
                }
        }
        .modelContainer(for: DayEntry.self)
    }
}

extension Notification.Name {
    static let openTodayTab = Notification.Name("openTodayTab")
}
