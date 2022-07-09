/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import Router from "../app/Router";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store";
import { formatDate } from "../app/format";
import router from "../app/Router";


describe("Given I am connected as an employee", () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    const user = JSON.stringify({
        type: 'Employee'
    })
    window.localStorage.setItem('user', user)

    // Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    // window.localStorage.setItem('user', JSON.stringify({
    //     type: 'Employee'
    // }))
    // met en place un élément DOM comme cible de rendu
    // const root = document.createElement("div")
    // root.setAttribute("id", "root")
    // document.body.append(root)
    // router()
    // window.onNavigate(ROUTES_PATH.Bills)
    // await waitFor(() => screen.getByTestId('icon-window'))
    // const windowIcon = screen.getByTestId('icon-window')

    describe("When I am on Bills Page", () => {
        test("Then should display the title of header", () => {
            //création du DOM : preparation data html role
            const html = BillsUI({ data: [] })
            document.body.innerHTML = html
            expect(screen.getAllByText("Mes notes de frais")).toBeTruthy()
        })

        test("then should be displayed the bills in the row", () => {
            //création du DOM avec l'objet bills en data: preparation data html role
            const html = BillsUI({ data: [...bills] })
            document.body.innerHTML = html
                //verifié aue la page affiche bien les 4 bills
            const allBills = screen.getAllByTestId("myBill")
            expect(allBills).toHaveLength(4)
                //vérifié les informations contenu dans le premier bills
            const billType = screen.getAllByTestId("type")
            expect(billType[0].innerHTML).toBe("Hôtel et logement")

            const billName = screen.getAllByTestId("name")
            expect(billName[0].innerHTML).toBe("encore")

            const billDate = screen.getAllByTestId("date")
            console.log(formatDate(billDate[0].innerHTML))
            expect(formatDate(billDate[0].innerHTML)).toBe("4 Avr. 04")

            const billAmount = screen.getAllByTestId("amount")
            expect(billAmount[0].innerHTML).toBe("400 €")

            const billStatus = screen.getAllByTestId("status")
            expect(billStatus[0].innerHTML).toBe("pending")

            const myIconEye = screen.getAllByTestId("icon-eye")
            expect(myIconEye[0]).toBeTruthy()
        })

        test("Then bill icon in vertical layout should be highlighted", () => {
            //const pathname = ROUTES_PATH['Bills'] //= pathname = chemin de l'URL de l'emplacement (#employee/bills)
            const pathname = ROUTES_PATH['Bills']

            Object.defineProperty(window, "location", { value: { hash: pathname } });
            document.body.innerHTML = `<div id="root"></div>`; // element parent dans router.js
            //utilisation Router() pour avoir la class .active
            Router()

            expect(screen.getByTestId('icon-window')).toHaveClass('active-icon')
        })

        test("Then bills should be ordered from earliest to latest", () => {
            const html = BillsUI({ data: bills })
            document.body.innerHTML = html
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted) //Utilisez .toEqual pour comparer récursivement toutes les propriétés des instances d'objets (également connu sous le nom d'égalité « profonde »).
        })
    })

    describe("When it's loading", () => {
        test("Then it should have a loading page", () => {
            // Build DOM as if page is loading
            const html = BillsUI({
                data: [],
                loading: true,
            })
            document.body.innerHTML = html

            expect(screen.getAllByText("Loading...")).toBeTruthy()
        });
    });

    describe("When there is an error", () => {
        test("Then it should have an error page", () => {
            // Build DOM as if page is not loading and have an error
            const html = BillsUI({
                data: [],
                loading: false,
                error: "erreur",
            })
            document.body.innerHTML = html

            expect(screen.getAllByText("Erreur")).toBeTruthy()
        });
    });
})

//1: test sur le bouton créer une nouvelle note de frais
describe("Given I am connected as Employee and I am on Bills page", () => {
    describe("When I'm click on the New Bill button", () => {
        test("Then I'm on the NewBill Page", () => {

            const html = BillsUI({ data: [] });
            document.body.innerHTML = html;

            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );

            const store = null
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            const bill = new Bills({
                document,
                onNavigate,
                store,
                localStorage: window.localStorage
            })
            const myHandleClickNewBill = jest.fn((e) => bill.handleClickNewBill(e)) //utilisation d une fonction simulée
            const billButton = screen.getByTestId('btn-new-bill')
            billButton.addEventListener('click', myHandleClickNewBill)
                //userEvent qui va simuler sur le DOM le click souris
            userEvent.click(billButton)

            expect(myHandleClickNewBill).toHaveBeenCalled() //verifier que la fonction simulée est bien appellée
            expect(screen.getByText("Envoyer une note de frais")).toBeTruthy() //verifier si l'element est bien vrai
        })
    })

    //2: test sur le bouton pour aficher la pièce jointe au note de frais(facture)
    //2.1: la fonction associé au btn eye est t elle bien appellée? .toHaveBeenCAlled()
    //2.2: la facture/modal s' est elle ouverte lors du clic sur chaque elements eyeIcon? .teBeTruthy()
    describe("When I click on the icon eye", () => {
        test("A modal file should open", () => {
            //DOM
            const html = BillsUI({ data: bills });
            document.body.innerHTML = html;

            //Mock
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            // store.bills = () => ({ bills, get: jest.fn().mockResolvedValue() })
            // window.localStorage.setItem(
            //     "user",
            //     JSON.stringify({
            //         type: "Employee",
            //     })
            // );

            //const store = null;
            // const onNavigate = (pathname) => {
            //     document.body.innerHTML = ROUTES({ pathname });
            // };

            const myBill = new Bills({
                document,
                onNavigate,
                store,
                localStorage: window.localStorage,
            });
            //l. 24-27
            $.fn.modal = jest.fn()

            //utiliser le premier element de tous element qui contiennent id="icon-eye"
            //si le premier passe, tous les autres seront ok
            //test sur la fonction du listener
            const iconEye = screen.getAllByTestId('icon-eye')[0]

            const myhandleClickIconEye = jest.fn(() => {
                myBill.handleClickIconEye(iconEye)
            })
            iconEye.addEventListener('click', myhandleClickIconEye)
                //userEvent qui va simuler sur le DOM le click souris
            userEvent.click(iconEye)

            expect(iconEye).toBeTruthy()
            expect(iconEye).toHaveAttribute('data-bill-url')
            expect(myhandleClickIconEye).toHaveBeenCalled()

            //test de la modal 
            const modaleFile = screen.getByTestId('modaleFileEmployee')
            expect(modaleFile).toBeTruthy()
            expect(screen.getByText("Justificatif")).toBeTruthy();

        })
    })
})

//Test d' intégration GET Bills
//Les tests d'intégration testent une fonctionnalité plus qu'on composant.
//Pour une API qui expose des données venant d'une base de données:
//un test d'intégration consiste à appeler une route d'API avec certains paramètres,
//et vérifier si le résultat correspond à la réponse attendue (- sans mocker les couches basses.)
//Jest doit savoir quand le code qu'il teste est terminé, avant de passer à un autre test: utilisation de async/await
describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills page", () => {
        //1:
        //verifié que l' appel est bien réalisé
        //vérifier qu' il a bien 4 bills dans l' API
        //verifié que le type du premier bills de l' API
        test("fetches bills from mock API GET", async() => {
            localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));

            const getSpy = jest.spyOn(store, "bills")
            store.bills()
            expect(getSpy).toHaveBeenCalled()
            expect(bills.length).toBe(4)
        })


        //2 :
        //ereur 404: "File Not Found", la page n'existe pas
        test("fetches bills from an API and fails with 404 message error", async() => {
            store.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 404"))
                    }
                }
            })
            const html = BillsUI({ error: "Erreur 404" })
            document.body.innerHTML = html
            const message = await screen.getByText(/Erreur 404/)
            expect(message).toBeTruthy()
        })

        //3:
        //error 500: "Internal Server Error", difficulté à trouver le page web sans être
        //capable d'identifier précisément la source du problème
        test("fetches messages from an API and fails with 500 message error", async() => {
            store.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 404"))
                    }
                }
            })
            const html = BillsUI({ error: "Erreur 500" })
            document.body.innerHTML = html
            const message = await screen.getByText(/Erreur 500/)
            expect(message).toBeTruthy()
        })
    })
})