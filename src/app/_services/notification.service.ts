import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private stompClient: Client | null = null;
  private notifications$ = new Subject<string>();

  connect(): Observable<string> {
    const socket = new SockJS('http://localhost:8080/websocket-notifications');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = () => {
      console.log('Connected to WebSocket');
      this.stompClient?.subscribe('/topic/notifications', (message: IMessage) => {
        this.notifications$.next(message.body);
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message']);
    };

    this.stompClient.activate();
    return this.notifications$.asObservable();
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('Disconnected from WebSocket');
    }
  }
}
