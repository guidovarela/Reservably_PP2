export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="container mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row justify-between gap-2">
        <p>© {new Date().getFullYear()} Barbería El Estilo</p>
        <p>Av. Corrientes 1234, CABA · +54 11 4555-1000</p>
      </div>
    </footer>
  )
}