import { Token } from '../../src/Token';
import { Reader } from './Reader';
import { Store } from './Store';

export const ReaderService = new Token<Reader>();
export const StoreService = new Token<Store>();
