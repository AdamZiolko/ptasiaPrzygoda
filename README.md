# ptasiaPrzygoda
## pobranie repozytorium z github
```bash
git clone https://github.com/AdamZiolko/ptasiaPrzygoda.git
```

## instalacja odpowiednich zależności - należy wykonać w folderze client\tukan-tomek i w folderze tukan-tomek\
```bash
#tukan-tomek\
npm install 

#client\tukan-tomek
npm install --legacy-peer-deps 
```

## instalacja bazy danych - katalogu główny
```bash
# uruchomienie bazy danych w dockerze
docker-compose up -d
```

```bash
# w katalogu tukan-tomek i po włączeniu CTRL + C
npm run start:dev

# utworzenie odpowiedniego schematu (hasło root)
docker exec -it ptasiaprzygoda-db-1 mysqladmin -u root -p create bazaTukana
```

## wykonanie odpowiednich migracji w folderze tukan-tomek/
```bash
# migracja bazy do najnowszej wersji
npx mikro-orm migration:up
```

## uruchomienie aplikacji - należy wykonać w folderze client\tukan-tomek i w folderze tukan-tomek\
```bash
# w katalogu client\tukan-tomek
npm run dev

# w katalogu tukan-tomek
npm run start:dev
```