import type { ConversationMessage } from '$lib/types/llm';

let messages = $state<ConversationMessage[]>([]);
let isLoading = $state(false);

export function getMessages(): ConversationMessage[] {
	return messages;
}

export function getIsLoading(): boolean {
	return isLoading;
}

export function addMessage(message: ConversationMessage): void {
	messages = [...messages, message];
}

export function setLoading(loading: boolean): void {
	isLoading = loading;
}

export function clearConversation(): void {
	messages = [];
}
