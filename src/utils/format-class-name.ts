export function formatClassName (ctor: any) {
    return String(ctor['name'] || ctor);
}