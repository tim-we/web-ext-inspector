export default class BrowserBookmarks {
  root: BookmarkNode = new BookmarkFolder("");
}

abstract class BookmarkNode {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

class Bookmark extends BookmarkNode {
  url: string;

  constructor(name: string, url: string) {
    super(name);
    this.url = url;
  }
}

class BookmarkFolder extends BookmarkNode {
  children: BookmarkNode[] = [];
}
