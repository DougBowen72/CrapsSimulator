export abstract class Common {
    public static rollDice() {
        // Can't simply take a random number between 2 and 12 because that would make all numbers equally
        // likely to occur.
        let die1 = Math.floor(Math.random() * 6 + 1);
        let die2 = Math.floor(Math.random() * 6 + 1);
        return die1 + die2;
    }
}