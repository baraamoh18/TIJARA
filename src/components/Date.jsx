function DateDisplay() {
    return (
        <p style={{
            fontFamily: "cairo, sans-serif",
            color: "#505050",
            fontSize: "12px",
            direction: "rtl",
            background: "#191919",
            padding: "5px 12px",
            borderRadius: "20px",
            border: "1px solid #ffffff10",
            margin: 0
        }}>
            {new Date().toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
        </p>
    )
}
export default DateDisplay