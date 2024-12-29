import { Component, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnChanges {
  @Input() address: string = ''; // Địa chỉ cần tìm kiếm
  @Input() uniqueId: string = ''; // ID duy nhất cho mỗi bản đồ

  private map: any; // Lưu trữ đối tượng bản đồ
  private mapInitialized: boolean = false; // Cờ kiểm tra khởi tạo bản đồ
  private pendingAddresses: string[] = []; // Hàng đợi địa chỉ chưa geocode

  ngAfterViewInit(): void {
    console.log('AfterViewInit: Gọi loadGoongMapSDK');
    this.loadGoongMapSDK();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['address'] && this.address) {
      if (this.mapInitialized) {
        this.geocodeAddress();
      } else {
        this.pendingAddresses.push(this.address);
      }
    }
  }

  private loadGoongMapSDK(): void {
    if (typeof window.goongjs === 'undefined') {
      setTimeout(() => {
        this.loadGoongMapSDK();
      }, 1000);
      return;
    }
    this.initializeMap();
  }

  private initializeMap(): void {
    const goongjs = (window as any).goongjs;

    if (!goongjs) {
      return;
    }

    goongjs.accessToken = 'srBfqDeVKb7g2cUQHICXhIXSGZnwaJc40578nQkd'; // Thay bằng API Key Goong của bạn

    this.map = new goongjs.Map({
      container: this.uniqueId, // Sử dụng uniqueId làm container
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [105.82690532800007, 20.992007990000047],
      zoom: 9,
    });

    this.mapInitialized = true;

    // Xử lý các địa chỉ trong hàng đợi
    while (this.pendingAddresses.length > 0) {
      const addressToGeocode = this.pendingAddresses.shift();
      if (addressToGeocode) {
        this.address = addressToGeocode;
        this.geocodeAddress();
      }
    }
  }

  private async geocodeAddress(): Promise<void> {
    const apiKey = 'eCzyKs6NbbagJ71z29WTADBByX1zwTOC27NputFm';
    const url = `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(this.address)}&api_key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.results && data.results[0]?.geometry) {
        const location = data.results[0].geometry.location;
        this.map.setCenter([location.lng, location.lat]);
        this.map.setZoom(15);

        new (window as any).goongjs.Marker({ color: 'red' })
          .setLngLat([location.lng, location.lat])
          .addTo(this.map);
      }
    } catch (error) {
      console.error('Lỗi khi sử dụng Goong API:', error);
    }
  }
}
