export interface LLMResponse {
	text: string;
	mood: CharacterMood;
	action: CharacterAction;
	voice: boolean;
}

export type CharacterMood =
	| 'neutral'
	| 'curious'
	| 'amused'
	| 'thoughtful'
	| 'excited'
	| 'surprised';

export type CharacterAction =
	| 'idle'
	| 'lean_forward'
	| 'lean_back'
	| 'sip_tea'
	| 'pick_up_card'
	| 'gesture'
	| 'nod'
	| 'laugh'
	| 'think';

export interface ConversationMessage {
	role: 'user' | 'assistant';
	content: string;
	mood?: CharacterMood;
	action?: CharacterAction;
	timestamp: number;
}
