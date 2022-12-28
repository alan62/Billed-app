/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom'
import '@testing-library/jest-dom'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import BillsUI from '../views/BillsUI.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import { localStorageMock } from '../__mocks__/localStorage.js'
import mockStore from '../__mocks__/store'
import { bills } from '../fixtures/bills.js'
import router from '../app/Router.js'

jest.mock('../app/store', () => mockStore)

describe('Given I am connected as an employee', () => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })

  window.localStorage.setItem(
    'user',
    JSON.stringify({
      type: 'Employee',
    })
  )

  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname, data: bills })
  }

  describe('When I am on NewBill Page', () => {
    test('Then email icon in vertical layout should be highlighted', async () => { // icone email qui prend la class active-icon
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const emailIcon = screen.getByTestId('icon-mail')

      expect(emailIcon).toHaveClass('active-icon') // On vérifie que l'icone email ait bien la class active-icon

      document.body.removeChild(root)
    })
  })

  describe('When I am on NewBill page and I upload a file with an extension other than jpg, jpeg or png', () => {
    test('Then an error message for the file input should be displayed', () => {
      document.body.innerHTML = NewBillUI()

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      })

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))

      const fileInput = screen.getByLabelText('Justificatif')
      fileInput.addEventListener('change', handleChangeFile)

      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(['test'], 'test.pdf', {
              type: 'application/pdf',
            }),
          ],
        },
      })

      expect(handleChangeFile).toHaveBeenCalled() // On vérifie que l'action est bien appelé

      expect(fileInput.files[0].name).toBe('test.pdf') // On vérifie que le test est fait sur le fichier test.pdf afin d'avoir l'erreur qui se déclence

      const errorMessage = screen.getByTestId('file-error-message') 

      expect(errorMessage).not.toHaveClass('hidden') // Si il y a une erreur alors  le message est affiché ( retrait de du style hidden )
    })
  })

  describe('When I am on the NewBill page and I upload a file with a jpg, jpeg or png extension', () => {
    test('Then no error message should be displayed', () => { 
      document.body.innerHTML = NewBillUI()

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        bills: bills,
        localStorage: window.localStorage,
      })

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))

      const fileInput = screen.getByLabelText('Justificatif')
      fileInput.addEventListener('change', handleChangeFile)

      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(['test'], 'test.jpg', {
              type: 'image/jpeg',
            }),
          ],
        },
      })

      expect(handleChangeFile).toHaveBeenCalled() // On vérifie que la fonction est bien appelé

      expect(fileInput.files[0].name).toBe('test.jpg') // On lance le test sur le fichier test.jpg afin de voir si il n'y a pas d'erreur

      const errorMessage = screen.getByTestId('file-error-message')

      expect(errorMessage).toHaveClass('hidden') // Si il n'y a pas d'erreur alors le résultat attendu est que le style reste bien sur hidden
    })
  })

  describe('When I am on NewBill page, I filled in the form correctly and I clicked on submit button', () => {
    // Si je suis sur la page mes notes de frais et que je valide une note alors je  retourne sur la page Bills
    test('Then Bills page should be rendered', () => { 
      document.body.innerHTML = NewBillUI()

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      })

      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      newBill.fileName = 'test.jpg'

      const formNewBill = screen.getByTestId('form-new-bill')
      formNewBill.addEventListener('submit', handleSubmit)

      fireEvent.submit(formNewBill)

      expect(handleSubmit).toHaveBeenCalled() // On vérifie que l'appel de la fonction handleSubmit se fait correctement

      expect(screen.getByText('Mes notes de frais')).toBeTruthy() // Le résultat attendu est un retour sur la page bills 
    })
  })
})

describe('Given I am connected as an employee', () => {
  // Connecté en tant qu'employée, quand je soumet un formulaire valide alors les données sont envoyés sur l'API
  describe('When I am on NewBill page and submit a valid form', () => {
    test('Then a new bill should be created in the API', async () => {
      document.body.innerHTML = NewBillUI()

      const earlyBillInfos = {
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        email: "a@a",
      }

      const mockedBills = mockStore.bills()

      const spyCreate = jest.spyOn(mockedBills, 'create')
      const spyUpdate = jest.spyOn(mockedBills, "update")

      const billCreated = await spyCreate(earlyBillInfos)

      expect(spyCreate).toHaveBeenCalled() // On vérifie que la fonction create est bien appelé

      expect(billCreated.key).toBe('47qAXb6fIm2zOKkLzMro') // On vérifie que la clé est bien celle définit 
      expect(billCreated.fileUrl).toBeUndefined() // On vérifie de l'url n'est pas définit
      expect(billCreated.fileName).toBe("preview-facture-free-201801-pdf-1.jpg") // On vérifie que le nom de l'image correspond bien

      const completeBillInfos = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        email: "a@a",
        pct: 20
      }

      const billUpdated = await spyUpdate(completeBillInfos)

      expect(billUpdated.id).toBe("47qAXb6fIm2zOKkLzMro") // On vérifie que l'id' est bien celle définit 
      // billUpdated = On vérifie que le mise à jour s'est bien déroulé et correspond pour le nom de l'image ainsi que l'url
      expect(billUpdated.fileUrl).toBe("https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a")
      expect(billUpdated.fileName).toBe("preview-facture-free-201801-pdf-1.jpg")
    })
  })

  describe('When an error occurs on API', () => {
    beforeEach(() => { // On lance plusieurs tests 
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      )

      document.body.innerHTML = NewBillUI()
    })

    test('Then new bill are added to the API but fetch fails with 404 message error', async () => {
      const spyedMockStore = jest.spyOn(mockStore, 'bills')

      spyedMockStore.mockImplementationOnce(() => { // On simule une création erreur 404
        return {
          create: jest.fn().mockRejectedValue(new Error('Erreur 404')),
        }
      })

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname, data: bills })
      }

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        bills: bills,
        localStorage: window.localStorage,
      })

      const fileInput = screen.getByLabelText('Justificatif')

      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(['test'], 'test.jpg', {
              type: 'image/jpeg',
            }),
          ],
        },
      })

      await spyedMockStore()

      expect(spyedMockStore).toHaveBeenCalled() // On vérifie que la fonction spyedMockStore est bien appelé
      expect(newBill.billId).toBeNull()  // On vérifie que l'id est null 
      expect(newBill.fileUrl).toBeNull() // On vérifie que l'url est null 

      spyedMockStore.mockReset() // Supprime toutes les simulations faites auparavant
      spyedMockStore.mockRestore() // Restaure l'implémentation non simulée
    })

    test('Then new bill are added to the API but fetch fails with 500 message error', async () => {
      const spyedMockStore = jest.spyOn(mockStore, 'bills')

      spyedMockStore.mockImplementationOnce(() => {
        return {
          create: jest.fn().mockRejectedValue(new Error('Erreur 500')),
        }
      })

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname, data: bills })
      }

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        bills: bills,
        localStorage: window.localStorage,
      })

      const fileInput = screen.getByLabelText('Justificatif')

      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(['test'], 'test.jpg', {
              type: 'image/jpeg',
            }),
          ],
        },
      })

      await spyedMockStore()

      expect(spyedMockStore).toHaveBeenCalled() // On vérifie que la fonction spyedMockStore est bien appelé
      expect(newBill.billId).toBeNull() // On vérifie que l'id est null
      expect(newBill.fileUrl).toBeNull() //  On vérifie que l'url est null
    })
  })
})
