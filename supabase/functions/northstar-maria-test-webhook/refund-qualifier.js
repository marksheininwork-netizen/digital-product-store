export function isQualifyingRefund(eventCharge, verifiedCharge) {
  if (!eventCharge || !verifiedCharge) return false;
  const eventAmountRefunded = eventCharge.amount_refunded;
  const currentAmountRefunded = verifiedCharge.amount_refunded;
  return eventCharge.id === verifiedCharge.id &&
    eventCharge.livemode === false &&
    verifiedCharge.livemode === false &&
    typeof eventCharge.payment_intent === "string" &&
    eventCharge.payment_intent.length > 0 &&
    eventCharge.payment_intent === verifiedCharge.payment_intent &&
    Number.isSafeInteger(eventAmountRefunded) &&
    eventAmountRefunded > 0 &&
    Number.isSafeInteger(verifiedCharge.amount) &&
    verifiedCharge.amount > 0 &&
    Number.isSafeInteger(currentAmountRefunded) &&
    currentAmountRefunded >= eventAmountRefunded &&
    currentAmountRefunded <= verifiedCharge.amount;
}
