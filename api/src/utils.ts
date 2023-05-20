// sdbm hash http://www.cse.yorku.ca/~oz/hash.html
export function seedID(id: string): string {
    let hash = 0;
    for (const char of id.split("")) {
        hash = (parseInt(char) || 0) + (hash << 6) + (hash << 16) - hash; 
    }

    return hash.toString();
}
