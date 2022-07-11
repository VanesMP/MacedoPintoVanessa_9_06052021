/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import Router from "../app/Router";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store";
import mockStore from "../__mocks__/store";
import { formatDate } from "../app/format";
import router from "../app/Router";


describe("Given I am connected as an employee", () => {
    // création d' un environnement :  création du localstorage par le mock dans le jestdom
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    const user = JSON.stringify({
        type: 'Employee',
        email: "employee@test.fr"
    })
    window.localStorage.setItem('user', user)

    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", () => {
            // pathname = chemin de l'URL de l'emplacement (#employee/bills)
            const pathname = ROUTES_PATH['Bills']
            Object.defineProperty(window, "location", { value: { hash: pathname } });
            document.body.innerHTML = `<div id="root"></div>`; // element parent dans router.js
            //utilisation Router() pour avoir la class .active
            Router()
                /************************** ajouter l' expect ************************************/
            expect(screen.getByTestId('icon-window')).toHaveClass('active-icon')
        })

        test("Then bills should be ordered from earliest to latest", () => {
            const html = BillsUI({ data: bills })
            document.body.innerHTML = html
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })

        /************** Ma partie de test **********************/

        test("Then should be displayed the bills in the row", () => {
            //je mets dans le body de mon DOM le BillsUI 
            const html = BillsUI({ data: [...bills] })
            document.body.innerHTML = html
                //verifie aue la page affiche bien les 4 bills de mon store
            const allBills = screen.getAllByTestId("myBill")
            expect(allBills).toHaveLength(bills.length)
                //vérifie les informations contenu dans le premier bills
            const billType = screen.getAllByTestId("type")
            expect(billType[0].innerHTML).toBe("Hôtel et logement")

            const billName = screen.getAllByTestId("name")
            expect(billName[0].innerHTML).toBe("encore")

            const billDate = screen.getAllByTestId("date")
            expect(formatDate(billDate[0].innerHTML)).toBe("4 Avr. 04")

            const billAmount = screen.getAllByTestId("amount")
            expect(billAmount[0].innerHTML).toBe("400 €")

            const billStatus = screen.getAllByTestId("status")
            expect(billStatus[0].innerHTML).toBe("pending")

            const myIconEye = screen.getAllByTestId("icon-eye") ////////////////////////// lequel est mieux??
            expect(myIconEye[0]).toBeTruthy()
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
                error: true,
            })
            document.body.innerHTML = html

            expect(screen.getAllByText("Erreur")).toBeTruthy()
        });
    });
})

//1: test sur le bouton créer une nouvelle note de frais
describe("Given I am connected as Employee and I am on Bills page", () => {
    Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
    });
    window.localStorage.setItem(
        "user",
        JSON.stringify({
            type: "Employee",
        })
    );
    describe("When I'm click on the New Bill button", () => {
        test("Then I'm on the NewBills Page", () => {
            const html = BillsUI({ data: [] });
            document.body.innerHTML = html;

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
                //verifier si l'element est bien vrai = on a ete redirigé vers la page NewBills
            expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
        })
    })

    describe("When I click on the icon eye", () => {
        test("A modal file should open", () => {
            //DOM
            const html = BillsUI({ data: bills });
            document.body.innerHTML = html;

            const myBill = new Bills({
                document,
                onNavigate,
                store,
                localStorage: window.localStorage,
            });

            //creation d une fonction fictive qui permet d' implementer la modale
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

            const modaleFile = screen.getByTestId('modaleFileEmployee')
            expect(modaleFile).toBeTruthy()
            expect(screen.getByText("Justificatif")).toBeTruthy();

        })
    })
})

//Test d' intégration GET Bills
//Les tests d'intégration testent une fonctionnalité plus qu'un composant.
//un test d'intégration consiste à appeler une route d'API avec certains paramètres,
//et vérifier si le résultat correspond à la réponse attendue.
//Jest doit attendre la réponse de la promesse pour finir le test: utilisation de async/await
describe("Given I am a user connected as Employee", () => {
    Object.defineProperty(
        window,
        'localStorage', { value: localStorageMock }
    )
    window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
    window.onNavigate(ROUTES_PATH.Bills)

    describe("When I navigate to Bills page", () => {
        //test qu 'il y ai le meme notre de bills dans le mock et dans le composant.
        test("fetches bills from mock API GET", async() => {

            await waitFor(() => screen.getAllByText("Mes notes de frais"))
            const rows = await screen.getAllByTestId("myBill")
            jest.spyOn(store, "bills")
            store.bills()
            expect(rows.length).toEqual(bills.length)

        })

        //test des erreurs : 404 / 500
        describe("When an error occurs on API", () => {
            jest.mock("../app/store", () => mockStore)

            jest.spyOn(mockStore, "bills");

            test("fetches bills from an API and fails with 404 message error", async() => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 404"))
                        }
                    }
                })

                document.body.innerHTML = BillsUI({ error: "Erreur 404 " })
                const message = await screen.getByText(/Erreur 404/)
                expect(message).toBeTruthy()
            })

            test("fetches messages from an API and fails with 500 message error", async() => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 500"))
                        }
                    }
                })

                document.body.innerHTML = BillsUI({ error: "Erreur 500 " })
                const message = await screen.getByText(/Erreur 500/)
                expect(message).toBeTruthy()
            })
        })
    })
})