export class TempAuthSystem {
    tempAuthKeys: string[] = []
    constructor() {
        this.tempAuthKeys = []
    }
    createKey() {
        const key = crypto.randomUUID()
        this.tempAuthKeys.push(key)
        return key
    }
    validateKey(key: string) {
        return this.tempAuthKeys.includes(key)
    } 
    validateAndUseKey(key: string) {
        if (this.validateKey(key)) {
            this.tempAuthKeys = this.tempAuthKeys.filter(k => k !== key)
            return true
        }
        return false
    }
}
