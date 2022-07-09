/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import '@testing-library/jest-dom'
import NewBillUI from "../views/NewBillUI.js"
import Router from "../app/Router"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import NewBill from "../containers/NewBill.js";
import store from "../__mocks__/store"
import BillsUI from "../views/BillsUI.js"
// import router from "../app/Router"


describe("Given I am connected as an employee", () => {
    // création d' un environnement controlé du DOM employee
    Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
    })
    const user = JSON.stringify({
        type: "Employee",
        email: "employee@test.fr",
    })
    window.localStorage.setItem("user", user)

    describe("When I am on NewBill Page", () => {
        //vérifier si le titre est afficher
        test("Then should display the title of header", () => {
            // je mets dans le body de mon DOM le NewBillUI
            const html = NewBillUI({ data: [] })
            document.body.innerHTML = html
            expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
        });

        //vérifier si l'icon mail est en surbrillance losque l' utilisateur est sur la page NewBill
        test("Then email icon in vertical layout should be highlighted", () => {
            // Build DOM New Bill 
            const pathname = ROUTES_PATH["NewBill"];
            Object.defineProperty(window, "location", {
                value: { hash: pathname },
            })
            document.body.innerHTML = `<div id="root"></div>`;
            // Router to have active class
            Router()
            expect(screen.getByTestId("icon-mail")).toHaveClass('active-icon')
        })
    })

    describe("When I upload a 'justificatif' in the a good format : jpg, jpeg, png", () => {
        test("Then the file could be add and no have alert message", () => {
            // Build DOM for new bill page
            const html = NewBillUI();
            document.body.innerHTML = html
            window.alert = () => {};

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            }

            const myNewBill = new NewBill({
                    document,
                    onNavigate,
                    store,
                    localStorage: window.localStorage,
                })
                // vérifier la presence d' un input file
            const inputJusticatifFile = screen.getByTestId('file')
            expect(inputJusticatifFile).toBeTruthy()
                //création de la simulation de la fonction sur l'element input file
            const myHandleChangeFile = jest.fn((e) => myNewBill.handleChangeFile(e))
                //création fichier qui a l'une des 3 extensions autorisées
            const file = new File(['fileBill'], 'fileBill.jpg', { type: 'file/jpg' })
                //vérifié la fonction d'envoie : handleChangeFile()
            inputJusticatifFile.addEventListener('change', myHandleChangeFile) //ajout d'un event listener de type change et de la fonction simulée
            fireEvent.change(inputJusticatifFile, { target: { files: [file] } })
                //vérifier le format du fichier dans son nom
            expect(inputJusticatifFile.files[0].name).toBe('fileBill.jpg')
                //vérifier que l' input file n' est pas vide
            expect(inputJusticatifFile.files[0]).toBeTruthy()
                //vérifier que la fonction simulé a été appelé
            expect(myHandleChangeFile).toHaveBeenCalled()


            jest.spyOn(window, 'alert').mockImplementation(() => {})
                //création de la simulation de la fonction pour l'alert window
                // vériife que l' alerta n'a pas été appellé puisque le fichier a la bonne extension
            expect(window.alert).not.toHaveBeenCalled()
        })
    })

    describe("When I upload a 'justificatif' in the wrong format : jpg, jpeg, png", () => {
        test("Then the file cannot be uploaded and an alert message appears", () => {
            // Build DOM for new bill page
            const html = NewBillUI();
            document.body.innerHTML = html

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            }

            const myNewBill = new NewBill({
                document,
                onNavigate,
                store,
                localStorage: window.localStorage,
            })

            //création de la simulation de la fonction sur l'element input file
            const myHandleChangeFile = jest.fn((e) => myNewBill.handleChangeFile(e));
            //création de l' element input file
            const inputJusticatifFile = screen.getByTestId('file')
                //vérifier sa presence 
            expect(inputJusticatifFile).toBeTruthy()

            //simulation de l'element input file avec l' ajout d' un fichier au mauvais format
            //création d' un fichier justificatif au mauvais format 
            const file = new File(['fileBill'], 'fileBill.pdf', { type: 'file/pdf' })
            inputJusticatifFile.addEventListener('change', myHandleChangeFile) //ajout d' un eventListener de type change et de la fonction simulée
            fireEvent.change(inputJusticatifFile, { target: { files: [file] } }) //utilisation de fireEvent pour simulé le click utilisateur dans le DOM
                //vérifier que le nom du fichier ne contient pas le bon format
            expect(inputJusticatifFile.files[0].name).not.toBe('fileBill.jpg')
                //vérifier que la fonction a été appellé
            expect(myHandleChangeFile).toHaveBeenCalled()

            //vérifier une alerte window en cas d'erreur
            // const myAlertWindow = jest.spyOn(window, 'alert');
            //création d'une fonction simulée pour l' alert window
            jest.spyOn(window, 'alert').mockImplementation(() => {})
                // window.alert = jest.fn()
                //     //vérifer l'éxecution de la fonction si l' extension du fichier est incorrect
                //     // expect(myAlertWindow).toHaveBeenCalled()
                // expect(window.alert).toBeCalledWith('Only a jpg, jpeg, or png format accepted')
            expect(window.alert).toHaveBeenCalled()
        })
    })

    describe("when I submit the form with empty fields", () => {
        test("then I should stay on new Bill page", () => {
            const html = NewBillUI();
            document.body.innerHTML = html

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            }

            const myNewBill = new NewBill({
                    document,
                    onNavigate,
                    store,
                    localStorage: window.localStorage,
                })
                //création de l' element input file
            const inputJusticatifFile = screen.getByTestId('file').value
                //vérifier l' absence de file dans l' inpur file
            expect(inputJusticatifFile).toBe("")
            expect(screen.getByTestId("file").value).toBe("")

            // //vérifier que les valeurs des inputs soient vides
            expect(screen.getByTestId("expense-name").value).toBe("");
            expect(screen.getByTestId("datepicker").value).toBe("");
            expect(screen.getByTestId("amount").value).toBe("");
            expect(screen.getByTestId("vat").value).toBe("");
            expect(screen.getByTestId("pct").value).toBe("");
            expect(screen.getByTestId("file").value).toBe("");

            const form = screen.getByTestId("form-new-bill");
            const myHandleSubmit = jest.fn((e) => myNewBill.handleSubmit(e));

            form.addEventListener("submit", myHandleSubmit);
            fireEvent.submit(form);
            expect(myHandleSubmit).toHaveBeenCalled();
            expect(form).toBeTruthy();
        })
    })

})

//TEST D' INTEGRATION POST
describe("Given I am connected as an employee", () => {
    describe('When I navigate to NewBill page', () => {
        //1:tester l' ajout/post d une nouvelle note de frais dans le store(contenant 4 note de frais de base & dc une nouvelle length de 5)
        test("Then add new bill from mock API POST", async() => {
            const html = NewBillUI();
            document.body.innerHTML = html
            const postSpy = jest.spyOn(store, "bills")
            const newBill = {
                "id": "47qAXb6fIm2zOKkLzMro",
                "vat": "80",
                "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                "status": "pending",
                "type": "Hôtel et logement",
                "commentary": "séminaire billed",
                "name": "encore",
                "fileName": "preview-facture-free-201801-pdf-1.jpg",
                "date": "2004-04-04",
                "amount": 400,
                "commentAdmin": "ok",
                "email": "a@a",
                "pct": 20
            }
            const bill = await store.bills(newBill)
            console.log(bill)
            expect(postSpy).toHaveBeenCalledTimes(1)
        })

        //2:
        //ereur 404: "File Not Found", la page n'existe pas
        test("Then add new bill from an API and fails with 404 message error", async() => {
            store.bills.mockImplementationOnce(() => {
                return {
                    update: () => {
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
        test("Then add new bill from an API and fails with 500 message error", async() => {
            store.bills.mockImplementationOnce(() => {
                return {
                    update: () => {
                        return Promise.reject(new Error("Erreur 500"))
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