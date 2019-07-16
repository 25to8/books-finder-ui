export class BookModel {
  kind: string;
  id: string;
  link: string;
  isFavorite: boolean;

  volumeInfo: {
    title: string;
    authors: string[];
    publisher: string;
    description: string;
    categories: string[];
    publishedDate: string;
    imageLinks: {
      smallThumbnail: string;
      thumbnail: string;
    };
  };

  saleInfo: {
    buyLink: string;
    listPrice: {
      amount: number;
      currencyCode: string;
    };
  };

  constructor(rawBook, isFavorite = false) {
    try {
      this.id = rawBook.id;
      this.link = rawBook.link;
      this.kind = rawBook.kind;
      this.isFavorite = isFavorite;

      if (rawBook.hasOwnProperty('volumeInfo')) {
        this.volumeInfo = rawBook.volumeInfo;
      }

      if (rawBook.hasOwnProperty('saleInfo')) {
        this.saleInfo = rawBook.saleInfo;
      }
    } catch (e) {
      console.error('BookModel building error:', e);
    }
  }
}
