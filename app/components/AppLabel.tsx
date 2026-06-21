export default function AppLabel({ children, htmlFor }: { children: React.ReactNode, htmlFor?: string }) {
    return <label className="text-foreground text-sm font-medium" htmlFor={htmlFor}>{children}</label>
}
