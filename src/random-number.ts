export default (event) => {
  const min = event.data.min
  const max = event.data.max

  if (min > max) {
    return {
      error: "Invalid input"
    }
  }

  const number = Math.random() * (max - min) + min

  return {
    data: {
      number
    }
  }
}