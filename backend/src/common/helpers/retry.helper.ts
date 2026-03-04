export async function withRetry(
    fn: () => Promise<unknown>,
    retries = 3,
    delayMs = 500,
    label = 'operation',
): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await fn();
            return;
        } catch (err) {
            if (attempt === retries) {
                console.error(`[Retry] ${label} failed after ${retries} attempts`, err);
                return;
            }
            const delay = attempt * delayMs;
            console.warn(`[Retry] ${label} attempt ${attempt} failed, retrying in ${delay}ms`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
}