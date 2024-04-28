var terbilang = (bilangan, satuan = "Rupee") => {
  bilangan = String(Math.trunc(bilangan));
  var angka = new Array(
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0"
  );
  var kata = new Array(
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine"
  );
  var tingkat = new Array("", "Thousand", "Lakh", "Crore", "Trillion");

  var panjang_bilangan = bilangan.length;

  /* check if number length is too long */
  if (panjang_bilangan > 15) {
    kaLimat = "Beyond Limit";
    return kaLimat;
  }

  /* put digits into array */
  for (let i = 1; i <= panjang_bilangan; i++) {
    angka[i] = bilangan.substr(-i, 1);
  }

  let i = 1;
  let j = 0;
  let kaLimat = "";

  /* iterate through the array of digits */
  while (i <= panjang_bilangan) {
    let subkaLimat = "";
    let kata1 = "";
    let kata2 = "";
    let kata3 = "";

    /* for Hundreds */
    if (angka[i + 2] != "0") {
      if (angka[i + 2] == "1") {
        kata1 = "One Hundred";
      } else {
        kata1 = kata[angka[i + 2]] + " Hundred";
      }
    }

    /* for Tens or Teens */
    if (angka[i + 1] != "0") {
      if (angka[i + 1] == "1") {
        switch (angka[i]) {
          case "0":
            kata2 = "Ten";
            break;
          case "1":
            kata2 = "Eleven";
            break;
          case "2":
            kata2 = "Twelve";
            break;
          case "3":
            kata2 = "Thirteen";
            break;
          case "4":
            kata2 = "Fourteen";
            break;
          case "5":
            kata2 = "Fifteen";
            break;
          case "6":
            kata2 = "Sixteen";
            break;
          case "7":
            kata2 = "Seventeen";
            break;
          case "8":
            kata2 = "Eighteen";
            break;
          case "9":
            kata2 = "Nineteen";
            break;
        }
      } else {
        kata2 = kata[angka[i + 1]] + "ty";
      }
    }

    /* for Units */
    if (angka[i] != "0") {
      if (angka[i + 1] != "1") {
        kata3 = kata[angka[i]];
      }
    }

    /* test if the digits are not all zeros, then add the level */
    if (angka[i] != "0" || angka[i + 1] != "0" || angka[i + 2] != "0") {
      subkaLimat = kata1 + " " + kata2 + " " + kata3 + " " + tingkat[j] + " ";
    }

    /* concatenate the results of one block of 3 digits */
    kaLimat = subkaLimat + kaLimat;
    i = i + 3;
    j = j + 1;
  }

  /* replace One Thousand with Thousand if needed */
  if (angka[5] == "0" && angka[6] == "0") {
    kaLimat = kaLimat.replace("One Thousand", "Thousand");
  }

  return kaLimat.trim() + " " + satuan;
};

export default terbilang;
