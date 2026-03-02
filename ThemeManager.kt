package com.example.smartreminder.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch

// DataStore لتخزين التفضيل
private val Context.dataStore by preferencesDataStore("settings")

// مفتاح تخزين الوضع الليلي
private val DARK_MODE_KEY = booleanPreferencesKey("dark_mode")

// CompositionLocal لتوفير دالة تبديل الوضع
val LocalDarkMode = compositionLocalOf { mutableStateOf(false) }
val LocalToggleDarkMode = compositionLocalOf<() -> Unit> { {} }

@Composable
fun SmartReminderTheme(
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    
    // استرجاع القيمة المحفوظة أو تبعية النظام
    val darkModeFlow = remember {
        context.dataStore.data.map { preferences ->
            preferences[DARK_MODE_KEY] ?: isSystemInDarkTheme()
        }
    }
    
    // حالة السمة الحالية
    var darkMode by remember { mutableStateOf(false) }
    
    // مراقبة التغييرات في DataStore
    LaunchedEffect(Unit) {
        darkModeFlow.collect { isDark ->
            darkMode = isDark
        }
    }
    
    // دالة تبديل الوضع
    val toggleDarkMode: () -> Unit = {
        scope.launch {
            val newValue = !darkMode
            context.dataStore.edit { preferences ->
                preferences[DARK_MODE_KEY] = newValue
            }
            // التحديث سيحدث تلقائياً عبر LaunchedEffect أعلاه
        }
    }
    
    // توفير القيم للـ Composables
    CompositionLocalProvider(
        LocalDarkMode provides remember { mutableStateOf(darkMode) },
        LocalToggleDarkMode provides toggleDarkMode
    ) {
        MaterialTheme(
            colorScheme = if (darkMode) darkScheme() else lightScheme(),
            typography = Typography(),
            content = content
        )
    }
}

// تعريف أنظمة الألوان (يمكنك استخدام الألوان التي لديك)
private fun darkScheme() = darkColorScheme(
    primary = Color(0xFF4CAF50),
    background = Color(0xFF121212),
    surface = Color(0xFF1E1E1E)
)

private fun lightScheme() = lightColorScheme(
    primary = Color(0xFF4CAF50),
    background = Color(0xFFFFFFFF),
    surface = Color(0xFFF5F5F5)
)
