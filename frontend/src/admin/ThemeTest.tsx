import { useTheme } from './ThemeContext';

export default function ThemeTest() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-8 min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Theme Test Page
        </h1>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Current theme: <strong className="text-blue-600 dark:text-blue-400">{theme}</strong>
          </p>
          
          <button
            onClick={() => {
              console.log('Button clicked! Current theme:', theme);
              toggleTheme();
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Toggle Theme (Current: {theme})
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Test Card 1</h3>
            <p className="text-gray-600 dark:text-gray-400">This card should change colors based on theme.</p>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Test Card 2</h3>
            <p className="text-gray-600 dark:text-gray-400">Check your browser console for debug messages.</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Debug Info:</h4>
          <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
            <li>• HTML class: <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">{document.documentElement.classList.contains('dark') ? 'dark' : 'light'}</code></li>
            <li>• Context theme: <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">{theme}</code></li>
            <li>• LocalStorage: <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">{localStorage.getItem('admin-theme') || 'not set'}</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
