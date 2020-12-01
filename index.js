const URL = "http://fb.dut.udn.vn/PageDangNhap.aspx"

const puppeteer = require("puppeteer")

const user = {
  username: "102170143",
  password: "dutdut123",
}

const main = async () => {
  console.log("hoo")
  const browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: false,
  })

  console.log("launched")

  const page = await browser.newPage()

  await page.goto(URL, {
    waitUntil: "domcontentloaded",
  })

  const usernameInputDOM = "#DN_txtAcc"
  const passwordInputDOM = "#DN_txtPass"

  await page.evaluate(
    ([usernameInputDOM, passwordInputDOM, user]) => {
      const usernameInput = document.querySelector(usernameInputDOM)
      usernameInput.value = user.username
      const passwordInput = document.querySelector(passwordInputDOM)
      passwordInput.value = user.password
    },
    [usernameInputDOM, passwordInputDOM, user]
  )

  await page.waitForTimeout(500)

  await page.click("#QLTH_btnLogin")

  await page.goto("http://fb.dut.udn.vn/PageLopHP.aspx")

  const assessURL = "http://fb.dut.udn.vn/PageDanhGiaCA.aspx?Loai=CK&LopHP="

  const lhps_id = await page.evaluate(() => {
    const lhps = document
      .querySelector("#LopHPGridInfo")
      .querySelectorAll(".GridRow td:nth-child(2)")
    const lhps_id = []
    lhps.forEach((element) => lhps_id.push(element.textContent))
    return lhps_id
  })

  await lhps_id.reduce((acc, id_lhp) => {
    return acc.then(async () => {
      const newPage = await browser.newPage()
      await newPage.setDefaultTimeout(0)
      await newPage.setDefaultNavigationTimeout(0)
      await newPage.goto(`${assessURL}${id_lhp}`, {
        waitUntil: "domcontentloaded",
      })

      await newPage.evaluate(() => {
        const quesResults = document.querySelectorAll(".quesResult")
        quesResults.forEach((ques, index) => {
          if (index === 35 || index === 36) {
            ques.querySelector("input:nth-child(2)").click()
            return
          }
          ques.querySelector("input").click()
        })
      })

      await newPage.evaluate(() => {
        const textareas = document.querySelectorAll(".quesTextAnswer textarea")
        textareas.forEach((textarea) => {
          textarea.value = "Ổn."
        })
      })

      await newPage.evaluate(() => {
        document.querySelector("#DG_btnXacNhan").click()
      })

      await newPage.waitForSelector(
        ".ui-dialog.ui-widget.ui-widget-content[aria-describedby='myDlgH'] .ui-button-text",
        {
          visible: true,
          timeout: 0,
        }
      )

      await newPage.waitForTimeout(1000)

      await newPage.click(
        ".ui-dialog.ui-widget.ui-widget-content[aria-describedby='myDlgH'] .ui-button-text"
      )
    })
  }, Promise.resolve())
}

main()
