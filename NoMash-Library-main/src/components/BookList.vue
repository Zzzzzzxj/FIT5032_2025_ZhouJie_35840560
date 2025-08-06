<template>
  <div>
    <h2>Books with ISBN > 1000</h2>
    <div v-if="loading" class="loading">Loading books...</div>
    <div v-else-if="books.length === 0" class="no-books">No books found with ISBN > 1000</div>
    <ul v-else class="book-list">
      <li v-for="book in books" :key="book.id" class="book-item">
        <strong>{{ book.name }}</strong> - ISBN: {{ book.isbn }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import db from '../firebase/init.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

const books = ref([]);
const loading = ref(true);

const fetchBooks = async () => {
  try {
    loading.value = true;
    const q = query(collection(db, 'books'), where('isbn', '>', 1000));
    const querySnapshot = await getDocs(q);
    const booksArray = [];
    querySnapshot.forEach((doc) => {
      booksArray.push({ id: doc.id, ...doc.data() });
    });
    books.value = booksArray;
  } catch (error) {
    console.error('Error fetching books: ', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBooks();
});
</script>

<style scoped>
.book-list {
  list-style: none;
  padding: 0;
}

.book-item {
  padding: 10px;
  margin: 5px 0;
  background-color: #f8f9fa;
  border-radius: 5px;
  border-left: 4px solid #007bff;
}

.loading {
  text-align: center;
  color: #666;
  font-style: italic;
}

.no-books {
  text-align: center;
  color: #666;
  font-style: italic;
}

h2 {
  color: #333;
  margin-bottom: 20px;
}
</style>