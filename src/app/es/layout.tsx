import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
export default function SpanishLayout({children}:{children:React.ReactNode}){return <div lang="es"><style>{`#en-frame > header,#en-frame > footer{display:none}`}</style><Header locale="es"/><div id="content">{children}</div><Footer locale="es"/></div>}
