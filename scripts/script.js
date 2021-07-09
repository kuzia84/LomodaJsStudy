const headerCityButton = document.querySelector(".header__city-button"),
  cartListGoods = document.querySelector(".cart__list-goods"),
  cartTotalCost = document.querySelector(".cart__total-cost");

let hash = location.hash.substr(1);

headerCityButton.textContent =
  localStorage.getItem("lamoda-location") || "Ваш город?";

headerCityButton.addEventListener("click", () => {
  const city = prompt("Укажите ваш город");
  headerCityButton.textContent = city;
  localStorage.setItem("lamoda-location", city);
});

const getLocalStorage = () =>
  JSON?.parse(localStorage.getItem("lamoda-cart")) || [];
const setLocalStorage = (data) =>
  localStorage.setItem("lamoda-cart", JSON.stringify(data));

const renderCart = () => {
  cartListGoods.textContent = "";
  const cartItems = getLocalStorage();
  let price = 0;
  cartItems.forEach((item, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${item.brand} ${item.name}</td>
      ${item.color ? `<td>${item.color}</td>` : "<td>-</td>"}
      ${item.size ? `<td>${item.size}</td>` : "<td>-</td>"}      
      <td>${item.cost} &#8381;</td>
      <td><button class="btn-delete" data-id="${item.id}">&times;</button></td>
    `;
    price += item.cost;
    cartListGoods.append(tr);
  });
  cartTotalCost.textContent = price + "₽";
};

const deleteItemCart = (id) => {
  const cartItems = getLocalStorage(),
    newCartItems = cartItems.filter((item) => item.id !== id);
  setLocalStorage(newCartItems);
};

cartListGoods.addEventListener("click", (e) => {
  if (e.target.matches(".btn-delete")) {
    deleteItemCart(e.target.dataset.id);
    renderCart();
  }
});

/* Блокировка скролла */

const disableScroll = () => {
  const widthScroll = window.innerWidth - document.body.offsetWidth;
  document.body.dbScrollY = window.scrollY;
  document.body.style.cssText = `
    position: fixed;
    top: ${-window.scrollY}px;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    padding-right: ${widthScroll}px;
  `;
};

const enableScroll = () => {
  document.body.style.cssText = "";
  window.scroll({
    top: document.body.dbScrollY,
  });
};

/* Модальное окно */
const subheaderCart = document.querySelector(".subheader__cart"),
  cartOverlay = document.querySelector(".cart-overlay");

const cartModalOpen = () => {
  cartOverlay.classList.add("cart-overlay-open");
  disableScroll();
  renderCart();
};

const cartModalClose = () => {
  cartOverlay.classList.remove("cart-overlay-open");
  enableScroll();
};

subheaderCart.addEventListener("click", cartModalOpen);

cartOverlay.addEventListener("click", (event) => {
  const target = event.target;

  if (target.matches(".cart__btn-close") || target.matches(".cart-overlay")) {
    cartModalClose();
  }
});

/* Запрос из базы данных */
const getData = async () => {
  const data = await fetch("db.json");

  if (data.ok) {
    return data.json();
  } else {
    throw new Error(
      `Данные не были получены, ошибка ${data.status} ${data.statusText}`
    );
  }
};
const getGoods = (callback, prop, value) => {
  getData()
    .then((data) => {
      if (value) {
        callback(data.filter((item) => item[prop] === value));
      } else callback(data);
    })
    .catch((err) => console.log(err));
};

/* странница категории */
try {
  const goodsList = document.querySelector(".goods__list");

  if (!goodsList) {
    throw "This is not a goods page!";
  }

  const changePageTitle = () => {
    document.querySelector(".goods__title").textContent =
      document.querySelector(`[href*="#${hash}"]`).textContent;
  };

  const createCard = (data) => {
    const { id, preview, cost, brand, name, sizes } = data;
    const li = document.createElement("li");
    li.classList.add("goods__item");
    li.innerHTML = `
      <article class="good">
        <a class="good__link-img" href="card-good.html#${id}">
            <img class="good__img" src="goods-image/${preview}" alt="">
        </a>
        <div class="good__description">
            <p class="good__price">${cost} &#8381;</p>
            <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
            ${
              sizes
                ? `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(
                    " "
                  )}</span></p>`
                : ""
            }
            <a class="good__link" href="card-good.html#${id}">Подробнее</a>
        </div>
    </article>
    `;
    return li;
  };
  const renderGoodsList = (data) => {
    goodsList.textContent = "";
    data.forEach((item) => {
      const card = createCard(item);
      goodsList.append(card);
    });
  };
  window.addEventListener("hashchange", () => {
    hash = location.hash.substr(1);
    getGoods(renderGoodsList, "category", hash);
    changePageTitle();
  });
  changePageTitle();
  getGoods(renderGoodsList, "category", hash);
} catch (error) {
  console.warn(error);
}

/* страница товара */
try {
  if (!document.querySelector(".card-good")) {
    throw "This is not a card-good page!";
  }

  const cardGoodImage = document.querySelector(".card-good__image"),
    cardGoodBrand = document.querySelector(".card-good__brand"),
    cardGoodTitle = document.querySelector(".card-good__title"),
    cardGoodPrice = document.querySelector(".card-good__price"),
    cardGoodSelectWrapper = document.querySelectorAll(
      ".card-good__select__wrapper"
    ),
    cardGoodColor = document.querySelector(".card-good__color"),
    cardGoodColorList = document.querySelector(".card-good__color-list"),
    cardGoodSizes = document.querySelector(".card-good__sizes"),
    cardGoodSizesList = document.querySelector(".card-good__sizes-list"),
    cardGoodBuy = document.querySelector(".card-good__buy");

  const generateList = (data) =>
    data.reduce(
      (html, item, i) =>
        html + `<li class="card-good__select-item" data-id=${i}>${item}</li>`,
      ""
    );

  const renderCardGood = ([{ id, brand, name, cost, color, sizes, photo }]) => {
    const data = { brand, name, cost, id };
    cardGoodImage.src = `goods-image/${photo}`;
    cardGoodImage.alt = `${brand} ${name}`;
    cardGoodBrand.textContent = brand;
    cardGoodTitle.textContent = name;
    cardGoodPrice.textContent = `${cost} ₽`;
    if (color) {
      cardGoodColor.textContent = color[0];
      cardGoodColor.dataset.id = 0;
      cardGoodColorList.innerHTML = generateList(color);
    } else {
      cardGoodColor.style.display = "none";
    }
    if (sizes) {
      cardGoodSizes.textContent = sizes[0];
      cardGoodSizes.dataset.id = 0;
      cardGoodSizesList.innerHTML = generateList(sizes);
    } else {
      cardGoodSizes.style.display = "none";
    }
    if (getLocalStorage().some((item) => item.id === id)) {
      cardGoodBuy.classList.add("delete");
      cardGoodBuy.textContent = "Удалить из корзины";
    }
    cardGoodBuy.addEventListener("click", () => {
      if (cardGoodBuy.classList.contains("delete")) {
        deleteItemCart(id);
        cardGoodBuy.classList.remove("delete");
        cardGoodBuy.textContent = "Добавить в корзину";
        return;
      }
      if (color) data.color = cardGoodColor.textContent;
      if (sizes) data.size = cardGoodSizes.textContent;

      cardGoodBuy.classList.add("delete");
      cardGoodBuy.textContent = "Удалить из корзины";

      const cardData = getLocalStorage();
      cardData.push(data);
      setLocalStorage(cardData);
    });
  };

  cardGoodSelectWrapper.forEach((item) => {
    item.addEventListener("click", (e) => {
      const target = e.target;

      if (target.closest(".card-good__select")) {
        target.classList.toggle("card-good__select__open");
      }

      if (target.closest(".card-good__select-item")) {
        const cardGoodSelect = item.querySelector(".card-good__select");
        cardGoodSelect.textContent = target.textContent;
        cardGoodSelect.dataset.id = target.dataset.id;
        cardGoodSelect.classList.remove("card-good__select__open");
      }
    });
  });

  getGoods(renderCardGood, "id", hash);
} catch (error) {
  console.warn(error);
}
