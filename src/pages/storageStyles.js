const buttonColor = "#22c97a"

const inputStyle = {
    backgroundColor: "#0d0d0d",
    border: "1px solid #2a2a2a",
    padding: "10px 12px",
    borderRadius: "8px",
    color: "white",
    font: "14px cairo, sans-serif",
    width: "100%",
    boxSizing: "border-box",
    outline: "none"
}

const generalStyles = {
    border: "none",
    borderBottom: "1px solid #1f1f1f",
    padding: "14px 16px",
    color: "#ccc",
    fontSize: "14px",
    fontFamily: "cairo, sans-serif",
    textAlign: "right"
}

const thStyles = {
    ...generalStyles,
    backgroundColor: "#111",
    color: "#888",
    fontSize: "17px",
    fontWeight: "600",
    letterSpacing: "0.5px"
}
export { thStyles, generalStyles, inputStyle, buttonColor }