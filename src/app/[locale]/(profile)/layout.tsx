
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-[90%] mx-auto grid">
        <div className="col-span-3"></div>
        {children}
    </div>
  )
}

export default layout