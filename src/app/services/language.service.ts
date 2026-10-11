import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Lang = 'en' | 'sw';

const MESSAGES: Record<Lang, Record<string, string>> = {
  en: {
    appName: 'Hotel Management System',
    contactUs: 'Contact us',
    welcome: 'Welcome',
    signInSubtitle: 'Sign in to continue to your dashboard',
    username: 'Username',
    enterUsername: 'Enter username',
    password: 'Password',
    enterPassword: 'Enter password',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    continueAsGuest: 'Continue as Guest',
    defaultCredentials: 'Default credentials:',
    errMissing: 'Please enter username and password.',
    errFailed: 'Login failed. Please try again.',
  },
  sw: {
    appName: 'Mfumo wa Usimamizi wa Hoteli',
    contactUs: 'Wasiliana nasi',
    welcome: 'Karibu',
    signInSubtitle: 'Ingia ili kuendelea kwenye dashibodi yako',
    username: 'Jina la mtumiaji',
    enterUsername: 'Weka jina la mtumiaji',
    password: 'Nenosiri',
    enterPassword: 'Weka nenosiri',
    signIn: 'Ingia',
    signingIn: 'Inaingia...',
    continueAsGuest: 'Endelea kama Mgeni',
    defaultCredentials: 'Vitambulisho vya chaguo-msingi:',
    errMissing: 'Tafadhali weka jina la mtumiaji na nenosiri.',
    errFailed: 'Kuingia kimeshindikana. Tafadhali jaribu tena.',
  },
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'hms_lang';
  private langSubject = new BehaviorSubject<Lang>('en');

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'en' || saved === 'sw') {
      this.langSubject.next(saved);
    }
  }

  get lang(): Lang {
    return this.langSubject.value;
  }

  get lang$() {
    return this.langSubject.asObservable();
  }

  setLang(lang: Lang): void {
    this.langSubject.next(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
  }

  t(key: string): string {
    return MESSAGES[this.langSubject.value][key] ?? MESSAGES.en[key] ?? key;
  }
}
