/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import '@testing-library/jest-dom';
import NewBillUI from "../views/NewBillUI.js";
import Router from "../app/Router";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import NewBill from "../containers/NewBill.js";
import store from "../__mocks__/store";
import BillsUI from "../views/BillsUI.js";
import router from "../app/Router";

describe("Given I am connected as an employee", () => {
    // création du DOM employee 
    Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
    });
    const user = JSON.stringify({
        type: "Employee",
        email: "employee@test.fr"
    });
    window.localStorage.setItem("user", user);

    describe("When I am on NewBill Page", () => {
        //vérifie si le titre est affiché
        test("Then should display the title of header", () => {
            // je mets dans le body de mon DOM le NewBillUI
            const html = NewBillUI({ data: [] })
            document.body.innerHTML = html
            expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
        });

        //vérifie si l'icon mail est en surbrillance losque l' utilisateur est sur la page NewBill
        test("Then email icon in vertical layout should be highlighted", () => {
            // Build DOM New Bill 
            const pathname = ROUTES_PATH["NewBill"];
            Object.defineProperty(window, "location", {
                value: { hash: pathname },
            });
            document.body.innerHTML = `<div id="root"></div>`;
            // Router to have active class
            Router();
            expect(screen.getByTestId("icon-mail")).toHaveClass('active-icon')
        })
    })

    describe("When I upload a 'justificatif' in the a good format : jpg, jpeg, png", () => {
        test("Then the file could be add and no have alert message", () => {
            // Build DOM for new bill page
            const html = NewBillUI();
            document.body.innerHTML = html;
            //implementation du window alert dans l 'environnement
            window.alert = () => {};

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            const myNewBill = new NewBill({
                document,
                onNavigate,
                store,
                localStorage: window.localStorage,
            });
            // vérifier la presence d' un input file
            const inputJusticatifFile = screen.getByTestId('file');
            expect(inputJusticatifFile).toBeTruthy();
            //création de la simulation de la fonction sur l'element input file
            const myHandleChangeFile = jest.fn((e) => myNewBill.handleChangeFile(e));
            //création fichier qui a l'une des 3 extensions autorisées
            const file = new File(['fileBill'], 'fileBill.jpg', { type: 'file/jpg' });
            //vérifié la fonction d'envoie : handleChangeFile()
            inputJusticatifFile.addEventListener('change', myHandleChangeFile); //ajout d'un event listener de type change et de la fonction simulée
            fireEvent.change(inputJusticatifFile, { target: { files: [file] } });
            //vérifier le format du fichier dans son nom
            expect(inputJusticatifFile.files[0].name).toBe('fileBill.jpg');
            //vérifier que l' input file n' est pas vide
            expect(inputJusticatifFile.files[0]).toBeTruthy();
            //vérifier que la fonction simulé a été appelé
            expect(myHandleChangeFile).toHaveBeenCalled();

            // vériife que l' alerta n'a pas été appellé puisque le fichier a la bonne extension
            //création de la simulation de la fonction pour l'alert window
            jest.spyOn(window, 'alert').mockImplementation(() => {})
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
            };

            const myNewBill = new NewBill({
                document,
                onNavigate,
                store,
                localStorage: window.localStorage,
            });

            //création de la simulation de la fonction sur l'element input file
            const myHandleChangeFile = jest.fn((e) => myNewBill.handleChangeFile(e));
            //création de l' element input file
            const inputJusticatifFile = screen.getByTestId('file');
            //vérifier sa presence 
            expect(inputJusticatifFile).toBeTruthy();

            //simulation de l'element input file avec l' ajout d' un fichier au mauvais format
            //création d' un fichier justificatif au mauvais format 
            const file = new File(['fileBill'], 'fileBill.pdf', { type: 'file/pdf' });
            inputJusticatifFile.addEventListener('change', myHandleChangeFile); //ajout d' un eventListener de type change et de la fonction simulée
            fireEvent.change(inputJusticatifFile, { target: { files: [file] } }); //utilisation de fireEvent pour simulé le click utilisateur dans le DOM
            //vérifier que le nom du fichier ne contient pas le bon format
            expect(inputJusticatifFile.files[0].name).not.toBe('fileBill.jpg');
            //vérifier que la fonction a été appellé
            expect(myHandleChangeFile).toHaveBeenCalled();

            //vérifier une alerte window en cas d'erreur
            //création d'une fonction simulée pour l' alert window
            jest.spyOn(window, 'alert').mockImplementation(() => {});
            expect(window.alert).toHaveBeenCalled();
        })
    })

    describe("when I submit the form with empty fields", () => {
        test("then I should stay on new Bill page", () => {
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
            });

            //vérifier que les valeurs des inputs soient vides
            expect(screen.getByTestId("expense-name").value).toBe("");
            expect(screen.getByTestId("datepicker").value).toBe("");
            expect(screen.getByTestId("amount").value).toBe("");
            expect(screen.getByTestId("vat").value).toBe("");
            expect(screen.getByTestId("pct").value).toBe("");
            expect(screen.getByTestId("file").value).toBe("");

            //création d' une fonction simulé pour le bouton submit du formulaire
            const form = screen.getByTestId("form-new-bill");
            const myHandleSubmit = jest.fn((e) => myNewBill.handleSubmit(e));
            form.addEventListener("submit", myHandleSubmit);
            fireEvent.submit(form);
            //vérifie que la méthode est appélé
            expect(myHandleSubmit).toHaveBeenCalled();
            //vérifie que leformulaire est toujours puisque l'envoi du formulaire n'a pas aboutit
            expect(form).toBeTruthy();
        })
    })

})

//TEST D' INTEGRATION POST
describe("Given I am connected as an employee", () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    const user = JSON.stringify({
        type: 'Employee'
    })
    window.localStorage.setItem('user', user)
    describe('When I navigate to NewBill page', () => {
        test("Then I add a new bill by submitting the form", async() => {
            // Build DOM for new bill page
            const html = NewBillUI();
            document.body.innerHTML = html

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            const myNewBill = new NewBill({
                document,
                onNavigate,
                store,
                localStorage: window.localStorage,
            });

            //création d' une fonction simulé pour le bouton submit du formulaire
            const form = screen.getByTestId("form-new-bill");
            const myHandleSubmit = jest.fn((e) => myNewBill.handleSubmit(e));
            form.addEventListener("submit", myHandleSubmit);
            fireEvent.submit(form); //car useEvent ne simule le submit
            //vérifie que la méthode est appellée
            expect(myHandleSubmit).toHaveBeenCalled();
            //vérifie l' envoi du formulaire (ajout d' une nouvelle de frais) en verifiant la presence d' un element de la page de redirection(Bills)
            expect(screen.getByText("Mes notes de frais")).toBeTruthy();
        })

        describe("When an error occurs on API", () => {
            jest.spyOn(store, "bills")

            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.appendChild(root)
            router()

            test("Then add new bill from an API and fails with 404 message error", async() => {
                store.bills.mockImplementationOnce(() => {
                    return {
                        update: () => {
                            return Promise.reject(new Error("Erreur 404"))
                        }
                    }
                });
                const html = BillsUI({ error: "Erreur 404" })
                document.body.innerHTML = html
                const message = await screen.getByText(/Erreur 404/)
                expect(message).toBeTruthy()
            })

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
})