export function toClickHouseDateTime(date: Date | null | undefined): string | null {
    if (!date) return null;
    return date.toISOString().replace('T', ' ').replace('Z', '').split('.')[0];
}