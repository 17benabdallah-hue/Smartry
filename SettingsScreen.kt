import androidx.compose.material3.Switch
import androidx.compose.runtime.Composable
import com.example.smartreminder.ui.theme.LocalDarkMode
import com.example.smartreminder.ui.theme.LocalToggleDarkMode

// في SettingsScreen.kt أو أي مكان يوجد به زر التبديل
@Composable
fun SettingsScreen() {
    // استخدم LocalDarkMode و LocalToggleDarkMode بدلاً من أي state محلي
    val darkModeState = LocalDarkMode.current
    val toggleDarkMode = LocalToggleDarkMode.current
    
    // مثال على Switch (بدون أي logic إضافي)
    Switch(
        checked = darkModeState.value,
        onCheckedChange = { toggleDarkMode() } // فقط استدعِ الدالة
    )
}

/*
// تأكد من أن setContent يبدو هكذا في MainActivity.kt:

setContent {
    SmartReminderTheme {
        // محتوى تطبيقك (بدون أي تدخل في السمة)
        MainScreen()
    }
}

// dependencies في build.gradle:
dependencies {
    // إذا لم تكن موجودة، أضف:
    implementation("androidx.datastore:datastore-preferences:1.0.0")
}
*/
