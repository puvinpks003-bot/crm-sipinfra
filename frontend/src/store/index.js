// A lightweight centralized state management system using JS Proxy and Observers
class Store {
    constructor(initialState = {}) {
        this.listeners = new Set();
        
        // Use Proxy to automatically trigger listeners on state mutation
        this.state = new Proxy(initialState, {
            set: (target, property, value) => {
                target[property] = value;
                this.notify();
                return true;
            }
        });
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener); // Return unsubscribe function
    }

    notify() {
        for (const listener of this.listeners) {
            listener(this.state);
        }
    }

    // Common State Actions
    setUser(user) {
        this.state.user = user;
    }

    setLeads(leads) {
        this.state.leads = leads;
    }
}

// Initial state shape
export const store = new Store({
    user: null,
    leads: [],
    quotes: [],
    notifications: [],
    isLoading: false,
    error: null
});
