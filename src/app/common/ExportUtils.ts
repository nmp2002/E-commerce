import { Injectable } from '@angular/core';
import { FileSaverService } from 'ngx-filesaver';
import { unzip } from 'unzipit';

export interface exportData {
    id: string,
    name: string,
    type: string
}

@Injectable({ providedIn: 'root' })
export class ExportUtils {

    constructor(private fileSaverService: FileSaverService) { }

    base64toBlob(base64Data: any, contentType: any): Blob {
        contentType = contentType || '';
        const sliceSize = 1024;
        const byteCharacters = atob(base64Data);
        const bytesLength = byteCharacters.length;
        const slicesCount = Math.ceil(bytesLength / sliceSize);
        const byteArrays = new Array(slicesCount);
    
        for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
          const begin = sliceIndex * sliceSize;
          const end = Math.min(begin + sliceSize, bytesLength);
    
          const bytes = new Array(end - begin);
          for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
          }
          byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return new Blob(byteArrays, { type: contentType });
    }

    downloadFile(data: any, contentType: any, filename: any) {
        const blob = new Blob([data], { type: contentType + '; charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        this.fileSaverService.save(blob, filename);
        // window.open(url, filename);
    }

    downloadFileThenOpen(data: any, contentType: any, filename: any, isopen: boolean) {
        const blob = new Blob([data], { type: contentType + '; charset=utf-8' });
        if (isopen) {
            const url = window.URL.createObjectURL(blob);
            window.open(url, filename);
        } else {
            this.fileSaverService.save(blob, filename);
        }
    }

    downloadFileZip(data: any, contentType: any) {
        const blob = new Blob([data], { type: contentType + '; charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        this.readFiles(url);
    }

    async readFiles(url: string) {
        const { entries } = await unzip(url);
        Object.entries(entries).forEach(async ([name, entry]) => {
            if (name.endsWith('.pdf')) {
                const blobPdf = await entry.blob('application/pdf; charset=utf-8');
                this.fileSaverService.save(blobPdf, name);
                const urlPdf = window.URL.createObjectURL(blobPdf);
                window.open(urlPdf, name);
            }
        });
    }
}